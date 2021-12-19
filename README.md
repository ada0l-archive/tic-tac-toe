# tic-tac-toe

## user

```
GET /user - get current user
```

```
POST /user - create user

[example input]

name
password
```

## room

```
GET /room - get rooms
```

```
POST /room - create room

[example input]
name
```

```
GET /room/<id> - get information about room
```

```
POST /room/join/<id> - join to room

[example input]
<empty>
```

```
GET /room/<id>/subscribe
```

```
POST /room/<id>/step

[example input]
x
y
```
