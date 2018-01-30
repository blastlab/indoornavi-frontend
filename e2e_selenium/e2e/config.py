class Config:

  def runningInDocker():
    with open('/proc/self/cgroup', 'r') as procfile:
      for line in procfile:
        fields = line.strip().split('/')
        if 'docker' in fields:
          return True
    return False


  DOCKER = runningInDocker()
  front_hostname = 'http://localhost:4200/'
  db_hostname = 'localhost'
