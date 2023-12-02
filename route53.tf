
resource "aws_route53_record" "terraform_alias" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = "resume.kalyanviswanath.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "terraform_alias2" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = "kalyanviswanath.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}