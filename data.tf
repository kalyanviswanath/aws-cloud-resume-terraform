# data source to fetch hosted zone info from domain name:
data "aws_route53_zone" "hosted_zone" {
  name = var.domain_name
}

data "aws_acm_certificate" "example" {
  domain   = "*.kalyanviswanath.com"  # Replace with your domain name
  statuses = ["ISSUED"]     # Optionally specify additional statuses if needed
}
