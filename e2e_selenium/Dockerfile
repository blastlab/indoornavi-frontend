FROM python:3.5

RUN apt-get update

RUN apt-get update && apt-get install -y \
	libgconf2-4 \
	libnss3 \
	libxss1 \
	fonts-liberation \
	libappindicator1 \
	xdg-utils \
	software-properties-common \
	curl \
	unzip \
	wget \
	xvfb \
	libasound2 \
	libgtk-3-0 \
    	default-jre \
	libappindicator3-1
	

# install chromedriver and google-chrome

RUN CHROMEDRIVER_VERSION=`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE` && \
    wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
RUN unzip chromedriver_linux64.zip -d /usr/bin
RUN chmod +x /usr/bin/chromedriver

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome*.deb
RUN apt-get install -y -f


# install phantomjs

RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    tar -jxf phantomjs-2.1.1-linux-x86_64.tar.bz2 && cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs

COPY requirements.txt /
RUN pip install -r requirements.txt && pip install html-testRunner


ENV APP_HOME /usr/src/app
WORKDIR /$APP_HOME

COPY . $APP_HOME/

CMD tail -f /dev/null

