resource "aws_dynamodb_table" "crc-dynamodb" {
  name           = "crc-dynamodb"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "ID"
 
  attribute {
    name = "ID"
    type = "S"
  }

  tags = {
    purpose   = "cloudresumechallenge"
    Environment = "production"
  }
}


resource "aws_dynamodb_table_item" "event_test" {
  table_name = aws_dynamodb_table.crc-dynamodb.name
  hash_key   = aws_dynamodb_table.crc-dynamodb.hash_key

  lifecycle {
    ignore_changes = all
  }

  item = <<ITEM
{
  "ID": {"S": "1"},
  "views":{"N":"2103"}
}
ITEM
}
