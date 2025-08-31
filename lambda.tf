resource "aws_lambda_function" "myfunc" {
    filename = data.archive_file.zip.output_path
    source_code_hash = data.archive_file.zip.output_base64sha256
    function_name = "myfunc"
    role = aws_iam_role.iam_for_lambda.arn
    handler = "func.lambda_handler"
    runtime = "python3.10"
depends_on  = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
        "Action": "sts:AssumeRole",
        "Principal": {
            "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
        }
    ]
}
EOF
}

resource "aws_iam_policy" "aws_iam_policy_for_resume_project" {
  name = "aws_iam_policy_for_resume_project"
  path = "/"
  description = "aws_iam_policy_for_resume_project"
    policy = jsonencode(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    "Effect": "Allow",
                    "Resource": "arn:aws:logs:*:*:*"
                },
                {
                    "Action": [
                        "dynamodb:*"
                    ],
                    "Effect": "Allow",
                    "Resource": "arn:aws:dynamodb:*:*:table/crc-dynamodb"
                }
            ]
        }
    )
}

resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
  role = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.aws_iam_policy_for_resume_project.arn
}
  


data "archive_file" "zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda/packedfunc.zip"
}
  
resource "aws_lambda_function_url" "url1" {
    function_name = aws_lambda_function.myfunc.function_name
    authorization_type = "NONE"

    cors {
    allow_credentials = true
    allow_origins     = [
      "https://resume.kalyanviswanath.com",
      "https://kalyanviswanath.com"
    ]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}
