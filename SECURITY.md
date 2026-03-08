# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please do NOT open a public issue.

Instead, please report it by emailing: aws-security@amazon.com

Include the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Best Practices

When using this tool:

1. **IAM Permissions**: Use least-privilege IAM policies
2. **Credentials**: Never commit AWS credentials to the repository
3. **S3 Buckets**: Enable encryption and versioning for log storage
4. **Network**: Use VPC endpoints for AWS service access when possible
5. **Secrets**: Use AWS Secrets Manager for sensitive configuration

## Supported Versions

We provide security updates for the latest major version only.

## Known Security Considerations

- This tool requires read access to CloudWatch Logs, which may contain sensitive data
- IAM policies should be scoped to specific resources where possible
- AgentCore agent has access to workflow metadata and logs
