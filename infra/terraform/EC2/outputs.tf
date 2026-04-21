output "ec2_public_ip" {
  description = "Public IP of the DevTracker EC2 instance"
  value       = aws_instance.ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the DevTracker EC2 instance"
  value       = aws_instance.ec2.public_dns
}

output "app_url" {
  description = "DevTracker app URL (available after bootstrap completes ~5-10 min)"
  value       = "http://${aws_instance.ec2.public_ip}"
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i <your-key>.pem ubuntu@${aws_instance.ec2.public_ip}"
}

output "bootstrap_log" {
  description = "Command to check bootstrap/playbook logs on EC2"
  value       = "ssh -i <your-key>.pem ubuntu@${aws_instance.ec2.public_ip} 'tail -f /var/log/devtracker-bootstrap.log'"
}