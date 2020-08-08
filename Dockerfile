FROM node:14.7.0

RUN apt-get update \
&& apt-get install -y \
   unzip \
   wget \
   libnss3 

WORKDIR /opt/docker

RUN getent group daemon || groupadd daemon
RUN id -u daemon &>/dev/null || useradd -r -g daemon
RUN chown -R daemon:daemon /opt/docker

COPY --chown=daemon:daemon . /opt/docker
RUN mkdir -p logs && chown -R daemon:daemon logs
RUN mkdir -p /tmp/chrome-profiles && chown -R daemon:daemon /tmp/chrome-profiles

EXPOSE 8050

# Run everything after as non-privileged user.
USER daemon

CMD [ "npm", "run", "start" ]
