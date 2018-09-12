# base image
FROM pelias/baseimage

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 unzip && rm -rf /var/lib/apt/lists/*

# change working dir
ENV WORKDIR /code/pelias/openstreetmap
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORKDIR}
RUN npm install

# add local code
ADD . ${WORKDIR}

# run tests
RUN npm test

# run as the pelias user
USER pelias
