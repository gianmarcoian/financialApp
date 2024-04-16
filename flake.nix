{
  description = "python and node containers";
  inputs = {nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";};
  outputs = {
    self,
    nixpkgs,
  }: let
    pkgs = nixpkgs.legacyPackages.x86_64-linux;
    pythonrequirement = (
      pkgs.python311.withPackages (ps:
        with ps; [
          pytest
          tornado
          pyyaml
        ])
    );
    noderequirements = with pkgs; [
      nodejs] ++ (with pkgs.nodePackages; [
      deno
      npm
      typescript
      typescript-language-server
      ts-node
      create-react-app
      #react-tools
      yarn
      nextjs
    ]);
    nginxrequirements = with pkgs; [
      nginx
    ];
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      packages = [pythonrequirement] ++ noderequirements;
    };

    packages.x86_64-linux.default = pythonrequirement;
    packages.x86_64-linux.pythoncode = pkgs.stdenv.mkDerivation {
      name = "pythoncode";
      src = ./pythonsrc;
      depsBuildTarget = [pythonrequirement];
      installPhase = ''
        mkdir -p $out/src/
        cp hello.py $out/src
      '';
    };
    packages.x86_64-linux.nodecode = pkgs.stdenv.mkDerivation {
      name = "nodecode";
      src = ./nodesrc;
      buildInputs = noderequirements;
      buildPhase = ''
        yarn blah blah blah
      '';
      installPhase = ''
        mkdir -p $out/src/
        cp . $out/src
      '';
    };
    formatter.x86_64-linux = pkgs.alejandra;
    packages.x86_64-linux.pythonbackend = pkgs.dockerTools.buildLayeredImage {
      name = "pythonimage";
      tag = "latest";
      contents = self.packages.x86_64-linux.pythoncode;
      # see https://github.com/opencontainers/image-spec/blob/main/config.md
      config = {
        #User = "";
        ExposedPorts = {"80/tcp" = {}; "443/tcp" = {};};
        # Env = [];
        Cmd = ["${pythonrequirement}/bin/python" "-m" "src.hello"];# Entrypoint=[ ]; 
        #Cmd = ["python" "-m" "src.hello"]; # Doesn't work.
        # Volumes = {"" = {}};
        # WorkingDir = "";
        # Labels = {"" = ""; }; # property MUST use annotation rules -> https://github.com/opencontainers/image-spec/blob/main/annotations.md#rules
        # StopSignal = "SIGKILL"; # or "SIGRTMIN+3"
      };
      architecture = "amd64"; # https://github.com/moby/moby/blob/daa4618da826fb1de4fc2478d88196edbba49b2f/image/spec/v1.2.md
      created = "now"; # break binary reproducibility, but it sorts...
      # maxLayers = 100; # by default, max is 125
      # extraCommands = [];
      # fakeRootCommands = optional for chown, else archive files owned by root
      # enableFakechroot = false; # default, 
    };
    packages.x86_64-linux.servefrontend = pkgs.dockerTools.buildLayeredImage {
      name = "serverimage";
      tag = "latest";
      fromImage = "nixpkgs/nginx:latest";
      created = "now"; # break binary reproducibility, but it sorts...
      contents = noderequirements;
      config = {
        Cmd = ["${pkgs.nginx}/bin/nginx"];
        ExposedPorts = { 
          "80/tcp" = {};
          "443/tcp" = {};
        };
      };
    };
    packages.x86_64-linux.nodefrontend = pkgs.dockerTools.buildLayeredImage {
      name = "nodeimage";
      tag = "latest";
      created = "now"; # break binary reproducibility, but it sorts...
      contents = noderequirements;
      config = {
        Cmd = ["${pkgs.yarn}/bin/yarn" "run" "start"];
      };
    };
  };
}
    /*
    # Executed by `nix flake check` 
    #checks.x86_64-linux."<name>" = derivation;
    checks.x86_64-linux.foo = pythonderivation;
    # Executed by `nix build .#<name>`
    #packages.x86_64-linux."<name>" = derivation;
    packages.x86_64-linux.pythoncontainer = pythoncontainer;
    # Executed by `nix build .`
    #packages.x86_64-linux.default = derivation;
    packages.x86_64-linux.default = pythoncontainer;
    # Executed by `nix run .#<name>`
    apps.x86_64-linux."<name>" = {
      type = "app";
      program = "<store-path>";
    };
    # Executed by `nix run . -- <args?>`
    apps.x86_64-linux.default = { type = "app"; program = "..."; };

    # Formatter (alejandra, nixfmt or nixpkgs-fmt)
    formatter.x86_64-linux = derivation;
    # Used for nixpkgs packages, also accessible via `nix build .#<name>`
    legacyPackages.x86_64-linux."<name>" = derivation;
    # Overlay, consumed by other flakes
    overlays."<name>" = final: prev: { };
    # Default overlay
    overlays.default = final: prev: { };
    # Nixos module, consumed by other flakes
    nixosModules."<name>" = { config }: { options = {}; config = {}; };
    # Default module
    nixosModules.default = { config }: { options = {}; config = {}; };
    # Used with `nixos-rebuild --flake .#<hostname>`
    # nixosConfigurations."<hostname>".config.system.build.toplevel must be a derivation
    nixosConfigurations."<hostname>" = {};
    # Used by `nix develop .#<name>`
    devShells.x86_64-linux."<name>" = derivation;
    # Used by `nix develop`
    devShells.x86_64-linux.default = derivation;
    # Hydra build jobs
    hydraJobs."<attr>".x86_64-linux = derivation;
    # Used by `nix flake init -t <flake>#<name>`
    templates."<name>" = {
      path = "<store-path>";
      description = "template description goes here?";
    };
    # Used by `nix flake init -t <flake>`
    templates.default = { path = "<store-path>"; description = ""; };


*/

