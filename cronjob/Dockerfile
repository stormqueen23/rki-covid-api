FROM python:3.9-slim

SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/app

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY . .

RUN apt-get update \
  && apt-get -y upgrade \
  && apt-get -y install build-essential binutils cron curl wget \
  && source $VIRTUAL_ENV/bin/activate \
  && pip install --no-cache-dir -r requirements.txt \
  && which cron \
  && rm -rf /etc/cron.*/* \
  && crontab crontab.file \
  && chmod 755 update.sh downloadDataDockerBuild.sh entrypoint.sh \
  && ./downloadDataDockerBuild.sh \
  && apt-get -y purge binutils build-essential wget \
  && apt-get -y --purge autoremove \
  && apt-get clean \
  && apt-get autoclean

VOLUME [ "/usr/src/app/Fallzahlen" ]

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["cron","-f", "-L", "15"]