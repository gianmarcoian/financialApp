from typing import Any
import tornado.web
import json
from .data import write_dict_to_yaml, return_yaml_to_python, user_exists, remove_user
from pathlib import Path
from logging import getLogger, basicConfig, DEBUG
from sys import stdout
from time import time

basicConfig(stream=stdout, level=DEBUG)
logger = getLogger(__name__)


class BaseHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers",
                        "x-requested-with, auth_user, auth_password")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.set_header("Access-Control-Expose-Headers",
                        "auth_user, auth_password")

    def post(self):
        self.write('some post')

    def get(self):
        self.write('some get')

    def options(self, *args):
        # no body
        # `*args` is for route with `path arguments` supports
        self.set_status(204)
        self.finish()

    def get_current_user(self):
        # In a perfect world, this is a JWT token in the header.
        # The server would have to generate a token, then pass it to the client upon login.
        # The client would then continue using this token in request headers which the
        # server can then verify.
        # This would probably cause a significant increase in complexity, as the server would need
        # to facilitate the token generation, as well as managing the life-time of each generated token
        # in an effort to cause them to timeout (and allow the user to logout).
        # This implementation just checks that the request contains a valid user name / password combo in plain text.
        print(self.request.headers)
        username = self.request.headers.get("auth_user")
        password = self.request.headers.get("auth_password")
        if (username is None or password is None):
            return None

        if (user_exists(username)):
            data = return_yaml_to_python(username)
            return username if data.get("password") == password else None
        return None

    def is_loggedin(self):
        # This is added in case we want to add more complicated verification logic later or something.
        return self.current_user != None


class CreateProfileHandler(BaseHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)
            username = data.get("username")
            if user_exists(username):
                self.set_status(400)
                self.write(
                    {"error": "Profile with this username already exists"})
            else:
                write_dict_to_yaml(data)
                self.write(data)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class UpdateProfileHandler(BaseHandler):
    def post(self):
        self.get_current_user()
        if not self.is_loggedin() or self.current_user is None:
            self.set_status(401)
            return

        try:
            new_data = json.loads(self.request.body)
            old_data = return_yaml_to_python(self.current_user)

            if "username" in new_data:
                old_username = old_data.get("username")
                old_data["username"] = new_data.get("username")

                # If we're trying to rename to a user that already has a profile, we
                # return a generic 404 response so we don't step-on the existing user's yaml.
                if (user_exists(old_data.get("username"))):
                    self.set_status(404)
                    return

                # We need to cleanup the old user's file now that it's an orphan.
                remove_user(old_username)

            if "password" in new_data:
                old_data["password"] = new_data.get("password")

            if "email" in new_data:
                old_data["email"] = new_data.get("email")

            # Write the new profile file.
            write_dict_to_yaml(old_data)

            self.set_default_headers()
            self.add_header("auth_user", old_data.get("username"))
            self.add_header("auth_password", old_data.get("password"))

        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class GetProfileHandler(BaseHandler):
    def get(self):
        self.get_current_user()
        if not self.is_loggedin() or self.current_user is None:
            self.set_status(401)
            return
        data = return_yaml_to_python(self.current_user)
        self.set_default_headers()
        self.write(data)


class LoginProfileHandler(BaseHandler):
    def post(self):
        req = json.loads(self.request.body)
        username = req.get("username")
        password = req.get("password")
        if (username is None or username == "" or password is None or password == ""):
            self.write({"error": "Profile not found"})
            self.set_status(404)
            return

        if user_exists(username):
            data = return_yaml_to_python(username)
            if (password == data.get("password")):
                self.add_header("auth_user", username)
                self.add_header("auth_password", password)
                self.set_status(200)
            else:
                self.set_status(404)
        else:
            self.write({"error": "Profile not found"})
            self.set_status(404)


class HelloHandler(BaseHandler):
    def get(self):
        self.write("API is up.")


class AddExpenseHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()

            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return

            expense_data = json.loads(self.request.body)
            id = round((time() / 60) / 24)

            expense = {
                "id": id,
                "date": expense_data.get("date"),
                "amount": expense_data.get("amount"),
                "category": expense_data.get("category"),
                "description": expense_data.get("description")
            }
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)

                # Check if the 'expense' key exists in the profile data. If not, create an empty list.
                if "expense" not in profile_data:
                    profile_data["expense"] = []
                profile_data["expense"].append(expense)

                # Save the updated profile data to YAML.
                write_dict_to_yaml(profile_data)
                self.set_status(200)
                self.write({"message": "expense added successfully"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class EditExpenseHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return

            expense_data = json.loads(self.request.body)
            expense_id = expense_data.get("id")

            if expense_id is None or expense_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid expense ID"})
                return

            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)

                if "expense" in profile_data:
                    # Search for the expense with the matching ID
                    for i, expense in enumerate(profile_data["expense"]):
                        if expense["id"] == expense_id:
                            # Update the found expense
                            profile_data["expense"][i] = {
                                "id": expense_data.get("id"),
                                "date": expense_data.get("date"),
                                "amount": expense_data.get("amount"),
                                "category": expense_data.get("category"),
                                "description": expense_data.get("description")
                            }

                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "expense updated successfully"})
                            return

                    # If the expense with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Expense with ID '{expense_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class DeleteExpenseHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return

            expense_data = json.loads(self.request.body)
            expense_id = expense_data.get("id")

            if expense_id is None or expense_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid expense ID"})
                return

            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)

                if "expense" in profile_data:
                    # Search for the expense with the matching ID
                    for i, expense in enumerate(profile_data["expense"]):
                        if expense["id"] == expense_id:
                            # Delete the found expense
                            del profile_data["expense"][i]

                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "expense deleted successfully"})
                            return

                    # If the expense with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Expense with ID '{expense_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class ListExpenseHandler(BaseHandler):
    def get(self):
        self.get_current_user()
        username = self.current_user
        try:
            expense_data = return_yaml_to_python(username).get("expense")
            output = dict()
            for i, _ in enumerate(expense_data):
                output[i] = expense_data[i]
            self.set_default_headers()
            self.write(output)
            print(f"Wrote {output}")
        except Exception as error:
            print(error)
            self.set_status(400)
            self.write({"error": repr(error)})


class AddAssetHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            asset_data = json.loads(self.request.body)
            id = round((time() / 60) / 24)
            defaults = dict.fromkeys(
                ["id", "name", "type", "amount", "current_value", "expected_return"])
            asset = defaults | asset_data
            asset["id"] = id
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                profile_data.setdefault('asset', []).append(asset)
                write_dict_to_yaml(profile_data)
                self.set_status(200)
                self.write({"message": "asset added successfully"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class EditAssetHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            asset_data = json.loads(self.request.body)
            asset_id = asset_data.get("id")
            if asset_id is None or asset_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid asset ID"})
                return
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            defaults = dict.fromkeys(
                ["name", "type", "amount", "current_value", "expected_return"])
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                if "asset" in profile_data:
                    # Search for the asset with the matching ID
                    for i, asset in enumerate(profile_data["asset"]):
                        if asset["id"] == asset_id:
                            # Update the found asset
                            profile_data["asset"][i] = defaults | asset_data
                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "asset updated successfully"})
                            return

                    # If the asset with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Asset with ID '{asset_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError as error:
            self.set_status(400)
            self.write({"error": f"Invalid JSON data {repr(error)}"})


class DeleteAssetHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            asset_data = json.loads(self.request.body)
            asset_id = asset_data.get("id")
            if asset_id is None or asset_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid asset ID"})
                return
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                if "asset" in profile_data:
                    # Search for the asset with the matching ID
                    for i, asset in enumerate(profile_data["asset"]):
                        if asset["id"] == asset_id:
                            # Delete the found asset
                            del profile_data["asset"][i]
                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "asset deleted successfully"})
                            return

                    # If the asset with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Asset with ID '{asset_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError as error:
            self.set_status(400)
            self.write({"error": f"Invalid JSON data {repr(error)}"})


class ListAssetHandler(BaseHandler):
    def get(self):
        self.get_current_user()
        username = self.current_user
        try:
            asset_data = return_yaml_to_python(username).get("asset")
            output = {i: asset_data[i] for i, _ in enumerate(asset_data)}
            self.set_default_headers()
            self.write(output)
            print(f"Wrote {output}")
        except Exception as error:
            print(error)
            self.set_status(400)
            self.write({"error": repr(error)})


class AddDebtHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            debt_data = json.loads(self.request.body)
            id = round((time() / 60) / 24)
            defaults = dict.fromkeys(
                ["id", "name", "type", "amount", "current_value", "interest_rate"])
            debt = defaults | debt_data
            debt["id"] = id
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                profile_data.setdefault('debt', []).append(debt)
                write_dict_to_yaml(profile_data)
                self.set_status(200)
                self.write({"message": "debt added successfully"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class EditDebtHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            debt_data = json.loads(self.request.body)
            debt_id = debt_data.get("id")
            if debt_id is None or debt_id < 0:
                print(f"Invalid debt id {debt_id}")
                self.set_status(400)
                self.write({"error": "Invalid debt ID"})
                return
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            defaults = dict.fromkeys(
                ["id", "name", "type", "amount", "current_value", "interest_rate"])
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                if "debt" in profile_data:
                    # Search for the debt with the matching ID
                    for i, debt in enumerate(profile_data["debt"]):
                        if debt["id"] == debt_id:
                            # Update the found debt
                            profile_data["debt"][i] = defaults | debt_data
                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "debt updated successfully"})
                            return

                    # If the debt with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Debt with ID '{debt_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError as error:
            print(error)
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class DeleteDebtHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return
            debt_data = json.loads(self.request.body)
            debt_id = debt_data.get("id")
            if debt_id is None or debt_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid debt ID"})
                return
            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)
                if "debt" in profile_data:
                    # Search for the debt with the matching ID
                    for i, debt in enumerate(profile_data["debt"]):
                        if debt["id"] == debt_id:
                            # Delete the found debt
                            del profile_data["debt"][i]
                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "debt deleted successfully"})
                            return

                    # If the debt with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Debt with ID '{debt_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class ListDebtHandler(BaseHandler):
    def get(self):
        self.get_current_user()
        username = self.current_user
        try:
            debt_data = return_yaml_to_python(username).get("debt")
            output = {i: debt_data[i] for i, _ in enumerate(debt_data)}
            self.set_default_headers()
            self.write(output)
            print(f"Wrote {output}")
        except Exception as error:
            print(error)
            self.set_status(400)
            self.write({"error": repr(error)})


class AddIncomeSourceHandler(BaseHandler):
    def post(self):
        self.set_default_headers()
        self.get_current_user()
        username = self.current_user
        try:
            data = json.loads(self.request.body)
            id = round((time() / 60) / 24)
            income_data = {
                "id": id,
                "name": data.get("name"),
                "type": data.get("type"),
                "amount": data.get("amount"),
                "frequency": data.get("frequency")
            }

            profile_path = Path.cwd() / f"{username}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(username)

                # Check if the 'income' key exists in the profile data. If not, create an empty list.
                if "income" not in profile_data:
                    profile_data["income"] = []

                # Append the new income data to the list of income sources.
                profile_data["income"].append(income_data)

                # Save the updated profile data to YAML.
                write_dict_to_yaml(profile_data)

                self.set_status(200)
                self.write({"message": "Income source added successfully"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{username}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class ListIncomeHandler(BaseHandler):
    def get(self):
        self.get_current_user()
        username = self.current_user
        try:
            income_data = return_yaml_to_python(username).get("income")
            output = dict()
            for i, _ in enumerate(income_data):
                output[i] = income_data[i]
            self.write(output)
            print(f"Wrote {output}")
        except Exception as error:
            print(error)
            self.set_status(400)
            self.write({"error": repr(error)})


class EditIncomeSourceHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return

            income_data = json.loads(self.request.body)
            income_id = income_data.get("id")

            if income_id is None or income_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid income source ID"})
                return

            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)

                if "income" in profile_data:
                    # Search for the income source with the matching ID
                    for i, income in enumerate(profile_data["income"]):
                        if income["id"] == income_id:
                            # Update the found income source
                            profile_data["income"][i] = {
                                "id": income_data.get("id"),
                                "name": income_data.get("name"),
                                "amount": income_data.get("amount"),
                                "type": income_data.get("type"),
                                "frequency": income_data.get("frequency")
                            }

                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "income source updated successfully"})
                            return

                    # If the income source with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Income source with ID '{income_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


class DeleteIncomeSourceHandler(BaseHandler):
    def post(self):
        try:
            self.set_default_headers()
            self.get_current_user()
            if not self.is_loggedin() or self.current_user is None:
                self.set_status(401)
                return

            income_data = json.loads(self.request.body)
            income_id = income_data.get("id")

            if income_id is None or income_id < 0:
                self.set_status(400)
                self.write({"error": "Invalid income source ID"})
                return

            profile_path = Path.cwd() / f"{self.current_user}.yaml"
            if profile_path.exists():
                profile_data = return_yaml_to_python(self.current_user)

                if "income" in profile_data:
                    # Search for the income source with the matching ID
                    for i, income in enumerate(profile_data["income"]):
                        if income["id"] == income_id:
                            # Delete the found income source
                            del profile_data["income"][i]

                            write_dict_to_yaml(profile_data)
                            self.set_status(200)
                            self.write(
                                {"message": "Income source deleted successfully"})
                            return

                    # If the income source with the specified ID is not found
                    self.set_status(404)
                    self.write(
                        {"error": f"Income source with ID '{income_id}' not found"})
                else:
                    self.set_status(404)
                    self.write(
                        {"error": f"Profile with username '{self.current_user}' not recognized"})
            else:
                self.set_status(404)
                self.write(
                    {"error": f"Profile with username '{self.current_user}' not recognized"})
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"error": "Invalid JSON data"})


def make_app():
    return tornado.web.Application([
        (r"/profile/create", CreateProfileHandler),
        (r"/profile/login", LoginProfileHandler),
        (r"/profile/update", UpdateProfileHandler),
        (r"/profile/", GetProfileHandler),
        (r"/", HelloHandler),
        (r"/profile/add_income", AddIncomeSourceHandler),
        (r"/profile/income", ListIncomeHandler),
        (r"/profile/edit_income", EditIncomeSourceHandler),
        (r"/profile/delete_income", DeleteIncomeSourceHandler),
        (r"/profile/add_expense", AddExpenseHandler),
        (r"/profile/edit_expense", EditExpenseHandler),
        (r"/profile/delete_expense", DeleteExpenseHandler),
        (r"/profile/expense", ListExpenseHandler),
        (r"/profile/add_asset", AddAssetHandler),
        (r"/profile/edit_asset", EditAssetHandler),
        (r"/profile/delete_asset", DeleteAssetHandler),
        (r"/profile/asset", ListAssetHandler),
        (r"/profile/add_debt", AddDebtHandler),
        (r"/profile/edit_debt", EditDebtHandler),
        (r"/profile/delete_debt", DeleteDebtHandler),
        (r"/profile/debt", ListDebtHandler),
    ])


if __name__ == "__main__":
    logger.info('serving localhost on port 8889')
    app = make_app()
    app.listen(8889)
    tornado.ioloop.IOLoop.current().start()
