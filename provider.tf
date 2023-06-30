terraform {

 cloud {
    organization = "watchdog"

    workspaces {
      name = "aws-cloud-resume-terraform"
    }
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




