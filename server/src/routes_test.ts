import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { BUILDINGS, parseEdges } from './campus';
import {
    clearDataForTesting, getBuildings, getUserData, getShortestPath,
    setUserData, getUserFriends, setUserFriends
  } from './routes';
import { readFileSync } from 'fs';


const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


describe('routes', function() {
  // TODO: add or update tests to verify you can set and get friends in task 5

  it('data_schedule', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/userData', query: {}});
    const res1 = httpMocks.createResponse();
    getUserData(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "user" was missing');

    // Request for schedule not present already should return empty.
    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/userData', query: {user: "Kevin"}});
    const res2 = httpMocks.createResponse();
    getUserData(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), {schedule: [], friends: []});

    const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData', body: {}});
    const res3 = httpMocks.createResponse();
    setUserData(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
            'missing or invalid "user" in POST body');

    // Set the schedule to have two people on it.
    const req5 = httpMocks.createRequest(
        {method: 'POST', url: '/api/userData',
         body: {user: "Kevin", schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},  // quantum ultra theory
            {hour: "11:30", location: "HUB", desc: "nom nom"},
          ]}});
    const res5 = httpMocks.createResponse();
    setUserData(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {saved: true});

    // Get schedule again to make sure it was saved.
    const req6 = httpMocks.createRequest(

        {method: 'GET', url: '/api/userData', query: {user: "Kevin"}});
    const res6 = httpMocks.createResponse();
    getUserData(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(), {
        schedule: [
            {hour: "9:30", location: "MLR", desc: "GREEK 101"},
            {hour: "10:30", location: "CS2", desc: "CSE 989"},
            {hour: "11:30", location: "HUB", desc: "nom nom"},
        ], friends: []
    });

    clearDataForTesting();
  });

  it('getBuildings', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/buildings', query: {}});
    const res1 = httpMocks.createResponse();
    getBuildings(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {buildings: BUILDINGS});
  });

  it('set and get friends', function () {
    clearDataForTesting();

    // Try getting friends for a non-existing user (should return empty list)
    const req1 = httpMocks.createRequest(
      { method: 'GET', url: '/api/getFriends', query: { user: "Kevin" } });
    const res1 = httpMocks.createResponse();
    getUserFriends(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { friends: [] });

    // Try setting friends for a user
    const req2 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setFriends', body: { user: "Kevin", friends: ["Alice", "Bob"] } });
    const res2 = httpMocks.createResponse();
    setUserFriends(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), { saved: true });

    // Get the friends list again to verify it was stored
    const req3 = httpMocks.createRequest(
      { method: 'GET', url: '/api/getFriends', query: { user: "Kevin" } });
    const res3 = httpMocks.createResponse();
    getUserFriends(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), { friends: ["Alice", "Bob"] });

    clearDataForTesting();
  });

  it('shortestPath with friends nearby', function () {
    clearDataForTesting();

    // Set schedules for Kevin and Alice
    const req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setData', body: { user: "Kevin", schedule: [
          { hour: "9:30", location: "MLR", desc: "GREEK 101" },
          { hour: "10:30", location: "CS2", desc: "CSE 989" },
          { hour: "11:30", location: "HUB", desc: "nom nom" },
        ] }});
    const res1 = httpMocks.createResponse();
    setUserData(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { saved: true });

    const req2 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setData', body: { user: "Alice", schedule: [
          { hour: "9:30", location: "LOW", desc: "MATH 201" },
          { hour: "10:30", location: "CS2", desc: "CSE 250" }, // Overlaps with Kevin
          { hour: "11:30", location: "MGH", desc: "LUNCH" },
        ] }});
    const res2 = httpMocks.createResponse();
    setUserData(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), { saved: true });

    // Make Kevin and Alice friends
    const req3 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setFriends', body: { user: "Kevin", friends: ["Alice"] } });
    const res3 = httpMocks.createResponse();
    setUserFriends(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), { saved: true });

    const req4 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setFriends', body: { user: "Alice", friends: ["Kevin"] } });
    const res4 = httpMocks.createResponse();
    setUserFriends(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), { saved: true });

    // Kevin requests shortest path at 10:30
    const req5 = httpMocks.createRequest(
      { method: 'GET', url: '/api/shortestPath', query: { user: "Kevin", hour: "10:30" } });
    const res5 = httpMocks.createResponse();
    getShortestPath(req5, res5);

    assert.deepStrictEqual(res5._getStatusCode(), 200);
    const data = res5._getData();
    assert.deepStrictEqual(data.found, true);
    assert.deepStrictEqual(data.path.length > 0, true);

    // Ensure Alice is included as a nearby friend
    assert.deepStrictEqual(data.nearby.length > 0, true);
    assert.deepStrictEqual(data.nearby.some((f: any) => f.friend === "Alice"), true);

    clearDataForTesting();
  });

  it('handles invalid input for friends', function () {
    clearDataForTesting();

    // Try setting friends with missing user
    const req1 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setFriends', body: { friends: ["Alice", "Bob"] } });
    const res1 = httpMocks.createResponse();
    setUserFriends(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'missing or invalid "user" or "friends" in POST body');

    // Try setting friends with non-array friends list
    const req2 = httpMocks.createRequest(
      { method: 'POST', url: '/api/setFriends', body: { user: "Kevin", friends: "Alice" } });
    const res2 = httpMocks.createResponse();
    setUserFriends(req2, res2);
    assert.deepStrictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'missing or invalid "user" or "friends" in POST body');

    // Try getting friends for a missing user param
    const req3 = httpMocks.createRequest(
      { method: 'GET', url: '/api/getFriends', query: {} });
    const res3 = httpMocks.createResponse();
    getUserFriends(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'required argument "user" was missing');

    clearDataForTesting();
  });


});
