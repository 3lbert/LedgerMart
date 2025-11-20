import time

def run_day_timer(duration_seconds):
    """Runs a count-up timer for a given duration."""
    for seconds in range(duration_seconds + 1):
        hrs, secs_rem = divmod(seconds, 3600)
        mins, secs = divmod(secs_rem, 60)
        print(f"\r⏱️ Day time: {hrs:02d}:{mins:02d}:{secs:02d}", end="")
        time.sleep(1)
    print("\n☀️ A new day has come!")

if __name__ == "__main__":
    print("Running a 10 second day as a test.")
    run_day_timer(10)