output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}
output "s3_bucket_name" {
  value = aws_s3_bucket.s3_bucket.id
}

output "aws_route53_zone" {
  value = data.aws_route53_zone.hosted_zone.name
}
  
output "certificate_arn" {
  value = data.aws_acm_certificate.example.arn
}

output "aws_route53_zone_id" {
  value = data.aws_route53_zone.hosted_zone.zone_id
}

output "cloudfront_distribution_hosted_zone_id" {
  value = aws_cloudfront_distribution.cdn.hosted_zone_id
}
/*
output "url" {
  value = aws_lambda_function_url.url1.function_url
}
*/
