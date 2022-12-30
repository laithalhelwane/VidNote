const request = require("supertest");
const app = require("../app");
const { userOne, userTow, setupDatabase } = require("./fixtures/db");
const path = require("path");

beforeEach(setupDatabase);

test("Should create a new User", async () => {
  await request(app)
    .post("/users")
    .send({
      userName: "Joelle",
      email: "joelle.elias@gmail.com",
      nickName: "Joelle",
      password: "red1234",
    })
    .expect(201);
});

test("Should not create new user when required field is missing", async () => {
  await request(app)
    .post("/users")
    .send({
      userName: "Joelle",
      email: "joelle.elias@gmail.com",
      nickName: "Joelle",
    })
    .expect(400);
});

test("Should not create new user when password length less than 7 charachters", async () => {
  await request(app)
    .post("/users")
    .send({
      userName: "Joelle",
      email: "joelle.elias@gmail.com",
      nickName: "Joelle",
      password: "l",
    })
    .expect(400);
});

test("Should not create new user when the email has alredy taken", async () => {
  await request(app)
    .post("/users")
    .send({
      userName: "Joelle",
      email: userOne.email,
      nickName: "Joelle",
      password: "l",
    })
    .expect(400);
});

test("Should not create new user when the userName has alredy taken", async () => {
  await request(app)
    .post("/users")
    .send({
      userName: userOne.userName,
      email: "joelle.elias@gmail.com",
      nickName: "Joelle",
      password: "l",
    })
    .expect(400);
});

test("Should login existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
});

test("Should not login non existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "lefay.yegar@hotmail.com",
      password: "wrongpassword",
    })
    .expect(401);
});

test("Should not login when required field is missing", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
    })
    .expect(400);
});

test("Should add new Avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .type("form")
    .attach("avatar", path.join(__dirname, "fixtures", "philly.jpg"))
    .expect(200);
});

test("Should not add non (jpg, png, jpeg) avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .type("form")
    .attach("avatar", path.join(__dirname, "fixtures", "text.txt"))
    .expect(400);
});
test("Should delete user avatar", async () => {
  await request(app)
    .delete("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test("Should logout existing user by deleting the used JWT", async () => {
  await request(app)
    .post("/users/logout")
    .set("Authorization", `Bearer ${userTow.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should get user information", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
test("Should get user by id", async () => {
  await request(app).get(`/users/${userOne._id}`).send().expect(200);
});
test("Should update user's data", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      userName: "newUserName",
    })
    .expect(200);
});
test("Should not update user's data with invalid body key", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      user: "newUserName",
    })
    .expect(400);
});

test("Should delete user from the Database", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userTow.tokens[0].token}`)
    .send()
    .expect(200);
});
