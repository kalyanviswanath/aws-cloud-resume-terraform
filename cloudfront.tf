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
  aliases = ["resume.kalyanviswanath.com", "kalyanviswanath.com"]
   /*
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
  */

  default_cache_behavior {
    target_origin_id        = local.s3_origin_id
    viewer_protocol_policy  = "redirect-to-https"
    cache_policy_id         = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # AWS Managed CachingDisabled
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # AWS Managed AllViewer
    allowed_methods         = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
}

  price_class = "PriceClass_200"
     restrictions {
    geo_restriction {
      restriction_type = "none"
      locations = []
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



