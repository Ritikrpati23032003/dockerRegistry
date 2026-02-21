terraform {
  backend "s3" {
    bucket         = "ritik-eks-terraform-state"
    key            = "eks/terraform.tfstate"
    region         = "us-east-1"
    #dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
