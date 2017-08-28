# base image
FROM pelias/baseimage

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# change working dir
ENV WORKDIR /code/pelias/openstreetmap
WORKDIR ${WORKDIR}

# add local code
ADD . ${WORKDIR}

# install npm dependencies
RUN npm install

# run tests
RUN npm test
