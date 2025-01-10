build-chatbot-api:
	# Change directory to chatbot-api and build Docker image
	cd chatbot-api && docker build . -t chatbot-api --platform linux/amd64 --no-cache

push-chatbot-api:
	# Tag the Docker image for ECR
	docker tag chatbot-api:latest 874128104192.dkr.ecr.us-west-2.amazonaws.com/chatbot:chatbot-api
	# Login to AWS ECR
	aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 874128104192.dkr.ecr.us-west-2.amazonaws.com
	# Push the Docker image to ECR
	docker push 874128104192.dkr.ecr.us-west-2.amazonaws.com/chatbot:chatbot-api
