brp () {
     nix build .#pythonbackend \
  && sudo docker load < result \
  && sudo docker run -p 8081:80 pythonimage
  #&& sudo docker run pythonimage -p 8081:80
}

brn () {
     nix build .#nodefrontend \
  && sudo docker load < result \
  && sudo docker run -p 8080:80 serverimage
}
