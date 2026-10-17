
from supabase_client import supabase

try:
    files = supabase.storage.from_("academic-resources").list()
    print("STORAGE ACCESS SUCCESSFUL")
    print("Files returned:", len(files))

except Exception as exc:
    print("STORAGE ACCESS FAILED")
    print("Exception type:", type(exc).__name__)
    print("Exception details:", repr(exc))
