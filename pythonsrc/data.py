import yaml
from pathlib import Path
from os import remove


def write_dict_to_yaml(input_dict):
    # Get the username from the dictionary
    username = input_dict.get("username", "default_username")

    # Generate the YAML file path based on the username
    yaml_file_path = f"{username}.yaml"

    # Write the data to a YAML file
    with open(yaml_file_path, 'w') as yaml_file:
        yaml.dump(input_dict, yaml_file, default_flow_style=False)
    print(f"Data has been written to '{yaml_file_path}' as YAML.")


def return_yaml_to_python(username):
    # Generate the YAML file path based on the username
    yaml_file_path = f"{username}.yaml"

    # Read data from the YAML file
    with open(yaml_file_path, 'r') as yaml_file:
        data = yaml.safe_load(yaml_file)
    print(f"Data has been loaded from '{yaml_file_path}'")
    return data


def user_exists(username):
    return (Path.cwd() / f"{username}.yaml").exists()


def remove_user(username):
    remove((Path.cwd() / f"{username}.yaml"))
