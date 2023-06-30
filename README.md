# AWS Cloud Resume Challenge using Terraform
Resources for cloud resume challenge.

![Application Diagram]( https://github.com/kalyanviswanath/aws-cloud-resume-terraform/blob/main/Cloud%20Resume%20Challenge.png )

Read original challenge here:
https://cloudresumechallenge.dev/docs/the-challenge/aws/


## Overview

The AWS Cloud Resume Challenge using Terraform involves the following requirements:

1. **Certification**: Add the AWS Cloud Practitioner certification to your resume.
2. **HTML**: Create your resume using HTML.
3. **CSS**: Style your resume using CSS.
4. **Static Website**: Deploy your HTML resume as an Amazon S3 static website.
5. **HTTPS**: Configure HTTPS for your S3 website using Amazon CloudFront.
6. **DNS**: Use Amazon Route 53 or any other DNS provider to point a custom domain to your CloudFront distribution.
7. **JavaScript**: Implement a visitor counter on your resume webpage using JavaScript.
8. **Database**: Use Amazon DynamoDB to store and retrieve the visitor count for your resume webpage.
9. **API**: Create an API using AWS API Gateway and AWS Lambda to communicate with the DynamoDB database.
10. **Python**: Write the AWS Lambda function code in Python using the boto3 library.
11. **Tests**: Include tests for your Python code.
12. **Infrastructure as Code**: Define your API resources and infrastructure using AWS Serverless Application Model (SAM) or Terraform.
13. **Source Control**: Set up a GitHub repository for your backend code.
14. **CI/CD (Back end)**: Use GitHub Actions to run Python tests and deploy the SAM or Terraform application when changes are pushed.
15. **CI/CD (Front end)**: Create a separate GitHub repository for your website code and configure GitHub Actions to automatically update the S3 bucket and invalidate CloudFront cache when changes are pushed.
16. **Blog Post**: Write a short blog post describing your learnings from working on this project and link it in your resume.
