Steps to run locally
1. make sure these things are running 
  1.1 Mongo at port 27017
  1.2 Redis at port 6379
  1.3 Node version > 20.6
2. Run the Node application


MongoDB database name: test(you can change it in .local.env file)

DB Models:
  1. Users: {
    public _id?: ObjectId;
    public username: string;
    public password: string;
    public name: string;
  }

    Index: userName
  2: Notes: {
    public _id?: ObjectId;
    public title : string;
    public content: string;
    public createdBy: ObjectId;
    public createdAt: Date;
    public updatedAt: Date;
    }

    Index: createdBy
          Query for text indexing(for search optimization)
          db.getCollection("Notes").createIndex({"title": "text", "content": "text"})

  3: NoteShares: {
      public _id?: ObjectId;
      public noteId: ObjectId;
      public sharedWith: ObjectId;
    }

    Index: a> noteId(to search share list for a particular note);
           b> sharedWith(to search shared note of a particular user)
  
  4: RateLimitingRule: {
      public _id?: ObjectId;
      public url: string;
      public method: string;
      public identification: string;
      public timeWindow: number;
      public allowedRate: number;
    }

    Index: (url+method)


Redis used for implementing rate limiting;

Query for rate limit settings - 
db.getCollection('RateLimitRules').insertOne({
  url: '/api/auth/login',
  method: 'POST',
  identification: 'ip',
  timeWindow: 60,
  allowedRate: 10,
});

db.getCollection('RateLimitRules').insertOne({
  url: '/api/auth/signup',
  method: 'POST',
  identification: 'ip',
  timeWindow: 60,
  allowedRate: 10,
});

db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes',
  method: 'GET',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 10,
});


db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes/:id',
  method: 'GET',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 10,
});

db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes/',
  method: 'POST',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 5,
});


db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes/:id',
  method: 'DELETE',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 5,
});


db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes/:id',
  method: 'PUT',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 5,
});

db.getCollection('RateLimitRules').insertOne({
  url: '/api/notes/:id/share',
  method: 'POST',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 5,
});

db.getCollection('RateLimitRules').insertOne({
  url: '/api/search',
  method: 'GET',
  identification: 'userId',
  timeWindow: 60,
  allowedRate: 5,
});



Postman Collection for API




[UserNotes.postman_collection.json](https://github.com/mishraatul549/NotesBackend/files/13830017/UserNotes.postman_collection.json)
