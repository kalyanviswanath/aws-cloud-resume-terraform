import json
import boto3
from typing import List

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('crc-dynamodb')


def has_visited(event) -> bool:
    """Returns True if the request includes a cookie indicating a prior visit.

    Supports Lambda Function URLs (payload v2.0) which provide a `cookies` list,
    and also checks raw Cookie headers for safety.
    """
    try:
        # Function URL / HTTP API v2 include parsed cookies
        cookies: List[str] = event.get('cookies') or []
        if any(c.strip().startswith('resume_visited=1') for c in cookies):
            return True
    except Exception:
        pass

    # Fallback: inspect Cookie header
    headers = (event.get('headers') or {}) if isinstance(event, dict) else {}
    cookie_header = headers.get('cookie') or headers.get('Cookie')
    if cookie_header and 'resume_visited=1' in cookie_header:
        return True

    return False


def get_views() -> int:
    resp = table.get_item(Key={'ID': '1'})
    item = resp.get('Item') or {}
    return int(item.get('views', 0))


def increment_views() -> int:
    # Atomic increment to avoid lost updates under concurrency
    upd = table.update_item(
        Key={'ID': '1'},
        UpdateExpression='SET views = if_not_exists(views, :zero) + :inc',
        ExpressionAttributeValues={':inc': 1, ':zero': 0},
        ReturnValues='UPDATED_NEW'
    )
    return int(upd['Attributes']['views'])


def lambda_handler(event, context):
    visited = has_visited(event or {})

    # Increment only if not visited; always return current count
    if visited:
        views = get_views()
        set_cookie = False
    else:
        views = increment_views()
        set_cookie = True

    # Build response compatible with Function URL (payload v2.0)
    resp = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'views': views})
    }

    # Set a cookie to avoid recounting for 24h (adjust Max-Age as needed)
    if set_cookie:
        # SameSite=None allows cross-site requests from your domain to the function URL
        cookie = 'resume_visited=1; Max-Age=86400; Path=/; Secure; HttpOnly; SameSite=None'
        # Function URLs (HTTP API v2) support a top-level `cookies` array
        resp['cookies'] = [cookie]
        # Also mirror via header for compatibility
        resp['headers']['Set-Cookie'] = cookie

    return resp
