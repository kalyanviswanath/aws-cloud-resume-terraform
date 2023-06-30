terraform {

backend "remote" {
    hostname     = "app.terraform.io"
    organization = "watchdog"

    workspaces {
      name = "aws-cloud-resume-terraform"
    }
    token = var.tf_token
}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}




