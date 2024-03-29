FROM node:18

# install python and make
RUN apt-get update && \
  apt-get install -y python3 build-essential && \
  apt-get purge -y --auto-remove

RUN groupadd -r runner && \
  useradd --create-home --home /home/runner -r -g runner runner

USER runner
WORKDIR /home/runner

COPY --chown=runner:runner package.json yarn.lock ./
RUN yarn install

COPY --chown=runner:runner  . .

ENV ENABLE_HEALTHCHECK=true
RUN yarn run build


ENTRYPOINT [ "yarn", "run", "start" ]
