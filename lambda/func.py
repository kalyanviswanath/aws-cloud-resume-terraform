import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('crc-dynamodb')

def lambda_handler(event, context):
    response = table.get_item(Key={
        'ID': '1'
    })
    views = response['Item']['views']
    views = views + 1
    print(views)
    
    response = table.put_item(Item={
        'ID': '1',
        'views': views
    })
    
    return views