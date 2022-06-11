set -euo pipefail

npm run build
rm build/*.png build/*.ico
aws s3 cp --recursive build s3://lord.geek.nz/please_wait/ --profile websiteuser
aws s3api put-object --bucket lord.geek.nz --key please_wait/  --profile websiteuser
aws cloudfront create-invalidation --distribution-id E1C3VH1NOERQGA --paths '/please_wait/*' --profile websiteuser
