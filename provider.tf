terraform {
/*
 cloud {
    organization = "watchdog"

    workspaces {
      name = "aws-cloud-resume-terraform"
    }
  }*/
  backend "s3" {
    bucket = "github-aws-cloud-resume-terraform" 
    region = "us-east-1"                   
    key    = "global/s3/terraform.tfstate"
    encrypt = true
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




