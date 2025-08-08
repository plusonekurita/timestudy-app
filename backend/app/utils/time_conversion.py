from datetime import datetime, timedelta, timezone

JST = timezone(timedelta(hours=9))

# どの時間帯か計算
def round_down_to_10min(dt):
    return dt.replace(minute=(dt.minute // 10) * 10, second=0, microsecond=0)

# 10分間に収める
def normalize_to_10_minutes(time_block_data):
    total_seconds = sum(time_block_data.values())
    if total_seconds == 0:
        return {}
    normalized = {}
    remaining = 10
    for label, seconds in sorted(time_block_data.items(), key=lambda x: -x[1]):
        minutes = round((seconds / total_seconds) * 10)
        minutes = min(minutes, remaining)
        normalized[label] = minutes
        remaining -= minutes
        if remaining <= 0:
            break
    return normalized

# 変換処理
def convert_with_time_split(records):
    result = {}
    for record in records:
        label = record["name"]

        # 日本時間に変更
        # start = datetime.fromisoformat(record["startTime"].replace("Z", "+00:00"))
        # end = datetime.fromisoformat(record["endTime"].replace("Z", "+00:00"))
        start = datetime.fromisoformat(record["startTime"].replace("Z", "+00:00")).astimezone(JST)
        end = datetime.fromisoformat(record["endTime"].replace("Z", "+00:00")).astimezone(JST)
        current = start

        while current < end:
            # 現在開始時刻の枠
            block_start = round_down_to_10min(current)
            block_end = block_start + timedelta(minutes=10)

            # 枠内の終了点（枠を超えないようにする）
            segment_end = min(end, block_end)
            seconds_in_block = int((segment_end - current).total_seconds())

            time_key = block_start.strftime("%H:%M")
            if time_key not in result:
                result[time_key] = {}
            if label not in result[time_key]:
                result[time_key][label] = 0
            result[time_key][label] += seconds_in_block
            current = segment_end

    # 正規化（10分におさめる）
    for time_key in result:
        result[time_key] = normalize_to_10_minutes(result[time_key])

    return result
