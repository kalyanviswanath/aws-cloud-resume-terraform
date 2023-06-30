resource "aws_s3_bucket" "s3_bucket" {
  bucket = "crc-s3"
  force_destroy = true
  tags = {
    Name = "My bucket"
  }
}
resource "null_resource" "local_provisioner" {
  depends_on = [aws_s3_bucket.s3_bucket]

  provisioner "local-exec" {

    command = "aws s3 sync resume-site/ s3://${module.s3_bucket.s3_bucket_id} --delete"
  }
}

/*
resource "null_resource" "local_provisioner" {
  triggers = {
    timestamp = timestamp()
  }

  provisioner "local-exec" {
    command = "aws s3 sync resume-site/ s3://${aws_s3_bucket.s3_bucket.bucket_id} --delete"
    #working_dir = "resume-site/"
    #interpreter = ["bash", "-c"]
  }
}
*/
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.s3_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.cdn_oai.iam_arn]
    }
  }
}


resource "aws_s3_bucket_policy" "docs" {
  bucket = aws_s3_bucket.s3_bucket.bucket
  policy = data.aws_iam_policy_document.s3_policy.json
}
