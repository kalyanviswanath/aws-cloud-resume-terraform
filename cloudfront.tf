resource "aws_cloudfront_origin_access_identity" "cdn_oai" {
  comment = "aws-cloud-resume-terraform-cloudfront-access"
}

locals {
  s3_origin_id = "myS3Origin"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.s3_bucket.bucket_regional_domain_name
    origin_id   = "myS3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cdn_oai.cloudfront_access_identity_path
    }
  }
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Some comment"
  default_root_object = "index.html"
  aliases = ["resume.kalyanviswanath.com"]
  # AWS Managed Caching Policy (CachingDisabled)
  default_cache_behavior {
    # Using the CachingDisabled managed policy ID:
    cached_methods = ["GET", "HEAD"]
    allowed_methods  = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }
  price_class = "PriceClass_200"
     restrictions {
    geo_restriction {
      restriction_type = "none"
    # restriction_type = "whitelist"
    # locations        = ["US", "CA", "GB", "DE", "IN"]
    }
  }

    viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.example.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2018"
  }

  # ... other configuration ...

}



