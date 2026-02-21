region               = "us-east-1"
cluster_name         = "ritik-eks-cluster"
vpc_cidr             = "10.0.0.0/16"
public_subnet_1_cidr = "10.0.1.0/24"
public_subnet_2_cidr = "10.0.2.0/24"
instance_type        = "t3.medium"

desired_size = 2
max_size     = 3
min_size     = 1
