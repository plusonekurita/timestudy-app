# 手動でDBに登録したい場合等にハッシュ化したパスワードを出力したい場合に使用してください
from passlib.hash import bcrypt as passlib_bcrypt

password = input("平文パスワードを入力してください: ")
hashed = passlib_bcrypt.hash(password)
print("ハッシュ化されたパスワード:", hashed)

