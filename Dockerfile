FROM node:14.7.0-alpine3.12

WORKDIR /opt/docker

RUN getent group daemon || groupadd daemon
RUN id -u daemon &>/dev/null || useradd -r -g daemon
RUN chown -R daemon:daemon /opt/docker

COPY --chown=daemon:daemon . /opt/docker

RUN mkdir -p logs && chown -R daemon:daemon logs

EXPOSE 8040

# Run everything after as non-privileged user.
USER daemon

CMD [ "npm", "run", "start" ]
