import sqlite3
import random
from datetime import datetime, timedelta

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('model/db/tg.db')
cursor = conn.cursor()

# Insert sample data into User table
users = [
    ('User{}'.format(i), 'user{}@example.com'.format(i), 'password{}'.format(i), random.randint(0, 1))
    for i in range(1, 11)
]
cursor.executemany('INSERT INTO "User" (userId, name, email, password, isShopKeeper) VALUES (NULL, ?, ?, ?, ?)', users)
conn.commit()

# Insert sample data into Place table
places = [
    ('Place{}'.format(i), 'Location{}'.format(i), 'Description of place {}'.format(i), 'photos/dir{}'.format(i))
    for i in range(1, 21)
]
cursor.executemany('INSERT INTO "Place" (placeId, name, location, description, photosDir) VALUES (NULL, ?, ?, ?, ?)', places)
conn.commit()

# Fetch all shopkeepers
cursor.execute('SELECT userId FROM "User" WHERE isShopKeeper = 1')
shopkeepers = [row[0] for row in cursor.fetchall()]

# Populate Owns table with correct ownership info
owns = []
for place_id in range(1, 21):
    if shopkeepers:
        owner = random.choice(shopkeepers)
        owns.append((owner, place_id))

cursor.executemany('INSERT INTO "Owns" (userId, placeId) VALUES (?, ?)', owns)
conn.commit()

# Insert sample data into Bookmark table
start_date = datetime.now()
bookmark_entries = set()
bookmarks = []

# Generate 30 unique bookmarks ensuring no duplicates
while len(bookmarks) < 30:
    user_id = random.randint(1, 10)
    place_id = random.randint(1, 20)
    if (user_id, place_id) not in bookmark_entries:
        bookmark_entries.add((user_id, place_id))
        bookmarks.append((
            start_date - timedelta(days=random.randint(0, 365)),
            user_id,  # Random userId
            place_id  # Random placeId
        ))

cursor.executemany('INSERT INTO "Bookmark" (bookmarkId, date, userId, placeId) VALUES (NULL, ?, ?, ?)', bookmarks)

# Commit changes and close connection
conn.commit()

cursor.execute('SELECT * FROM "User"')
userss = cursor.fetchall()
print("All users in the database:")
for userssss in userss:
    print(userssss)

conn.close()

print("Database populated successfully.")
