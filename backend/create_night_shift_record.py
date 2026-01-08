#!/usr/bin/env python3
"""
夜勤レコードのデモデータを作成するスクリプト

使用方法:
    python create_night_shift_record.py

または:
    python -m app.create_night_shift_record
"""

from app.seeds.seed_data import create_night_shift_record

if __name__ == "__main__":
    print("夜勤レコードを作成します...")
    create_night_shift_record()
    print("完了しました。")




