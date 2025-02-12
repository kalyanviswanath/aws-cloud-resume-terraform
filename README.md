# 🌐 AWS Cloud Resume Challenge using Terraform

![Application Diagram](Cloud%20Resume%20Challenge.png)

## 🚀 Overview

This project automates the deployment of an AWS-based **Cloud Resume** using **Terraform** and **GitHub Actions**. The setup includes hosting a resume on **Amazon S3**, making it accessible via **CloudFront**, and integrating a **visitor counter** using **API Gateway, Lambda, and DynamoDB**.

### 🔹 **Components Used**
- **Amazon S3**: Stores and serves the resume website.
- **Amazon CloudFront**: Distributes the website globally with HTTPS.
- **Amazon Route 53**: Manages DNS and custom domain.
- **Amazon DynamoDB**: Stores visitor counts.
- **AWS Lambda**: Handles API logic for visitor tracking.
- **Amazon API Gateway**: Connects frontend with backend.
- **Terraform**: Manages the infrastructure as code.
- **GitHub Actions**: Automates deployment and updates.

---

## 📌 Features

✅ **Static Website Hosting** via **Amazon S3 & CloudFront**  
✅ **Custom Domain & SSL** via **Amazon Route 53 & Certificate Manager**  
✅ **Visitor Counter** powered by **DynamoDB, API Gateway, and Lambda**  
✅ **Automated Infrastructure Management** with **Terraform**  
✅ **CI/CD Deployment Pipeline** using **GitHub Actions**  

---

## 🛠️ Terraform Modules

### **`variables.tf`**
Defines input variables for Terraform such as AWS region, domain name, and resource names.

### **`provider.tf`**
Configures the AWS provider for Terraform to interact with AWS services.

### **`route53.tf`**
Sets up the Route 53 DNS records to associate a custom domain with the CloudFront distribution.

### **`s3.tf`**
Configures an S3 bucket for static website hosting and ensures public access settings are correct.

### **`cloudfront.tf`**
Deploys a CloudFront distribution to serve the S3-hosted website securely with HTTPS.

### **`dynamodb.tf`**
Creates a DynamoDB table to store visitor counts for the resume site.

### **`lambda.tf`**
Defines the AWS Lambda function that interacts with DynamoDB to update and retrieve the visitor count.

### **`output.tf`**
Specifies output values such as CloudFront URL and API Gateway endpoint to retrieve necessary deployment details.

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/kalyanviswanath/aws-cloud-resume-terraform.git
cd aws-cloud-resume-terraform
```

### 2️⃣ Configure AWS Credentials

Ensure AWS credentials are set up either via **AWS CLI**:

```sh
aws configure
```

Or set the following **GitHub Secrets**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### 3️⃣ Initialize Terraform

```sh
terraform init
```

### 4️⃣ Deploy Infrastructure

```sh
terraform apply -auto-approve
```

---

## 🔄 Automation Workflow

### 🔹 **GitHub Actions for CI/CD**

The following workflows automate the infrastructure deployment and updates:

#### **1️⃣ Terraform Plan & Apply** (`Apply.yaml`)
- Runs on pushes to the `deploy` branch.
- Plans and applies Terraform changes.
- Uploads updated resume files to S3.

#### **2️⃣ Terraform Build** (`build.yaml`)
- Runs on pushes to the `deploy` branch.
- Builds and applies Terraform infrastructure.

#### **3️⃣ Terraform Plan** (`plan.yaml`)
- Runs on pushes to the `main` branch.
- Performs a Terraform plan to preview changes.

#### **4️⃣ Terraform Destroy** (`Destroy.yaml`)
- Runs on pushes to the `destroy` branch.
- Destroys the AWS resources managed by Terraform.

#### **5️⃣ Upload Resume to S3** (`UploadToS3.yml`)
- Uploads resume files to S3 when changes are detected in `resume-site/**`.

```yaml
on:
  push:
    paths:
      - "cloudfront.tf"
      - "dynamodb.tf"
      - "lambda.tf"
      - "route53.tf"
      - "s3.tf"
      - "variables.tf"
      - "resume-site/**"
```

---
