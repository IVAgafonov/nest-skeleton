FROM node:14.7.0

RUN apt-get update \
&& apt-get install -y \
   unzip \
   gconf-service \
   libasound2 \
   libatk1.0-0 \
   libatk-bridge2.0-0 \
   libc6 \
   libcairo2 \
   libcups2 \
   libdbus-1-3 \
   libexpat1 \
   libfontconfig1 \
   libgcc1 \
   libgconf-2-4 \
   libgdk-pixbuf2.0-0 \
   libglib2.0-0 \
   libgtk-3-0 \
   libnspr4 \
   libpango-1.0-0 \
   libpangocairo-1.0-0 \
   libstdc++6 \
   libx11-6 \
   libx11-xcb1 \
   libxcb1 \
   libxcomposite1 \
   libxcursor1 \
   libxdamage1 \
   libxext6 \
   libxfixes3 \
   libxi6 \
   libxrandr2 \
   libxrender1 \
   libxss1 \
   libxtst6 \
   ca-certificates \
   fonts-liberation \
   libappindicator1 \
   libnss3 \
   lsb-release \
   xdg-utils \
   wget

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
