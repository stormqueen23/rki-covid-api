FROM rubber4duck/fixbase:latest

SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/app

COPY . .

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y cron curl wget \
  && which cron \
  && rm -rf /etc/cron.*/* Dockerfile.base\
  && apt-get clean \
  && crontab crontab.file \
  && chmod 755 update.sh downloadDataDockerBuild.sh entrypoint.sh\
  && ./downloadDataDockerBuild.sh

VOLUME [ "/usr/src/app/Fallzahlen" ]

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["cron","-f", "-L", "15"]