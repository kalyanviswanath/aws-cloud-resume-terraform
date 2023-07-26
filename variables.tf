variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "domain_name" {
  type        = string
  description = "The domain name to use"
  default     = "resume.kalyanviswanath.com"
}
