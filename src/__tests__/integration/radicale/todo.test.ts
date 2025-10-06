import fsp from 'fs/promises';

import { createAccount } from '../../../account';
import { fetchCalendars } from '../../../calendar';
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../../../todo';
import { DAVAccount, DAVCalendar } from '../../../types/models';
import { getBasicAuthHeaders } from '../../../util/authHelpers';

let authHeaders: {
  authorization?: string;
};

let account: DAVAccount;
let calendar: DAVCalendar;

beforeAll(async () => {
  authHeaders = getBasicAuthHeaders({
    username: process.env.CALDAV_USERNAME,
    password: process.env.CALDAV_PASSWORD,
  });

  account = await createAccount({
    account: {
      serverUrl: process.env.CALDAV_SERVER_URL ?? '',
      accountType: 'caldav',
    },
    headers: authHeaders,
  });

  const calendars = await fetchCalendars({
    account,
    headers: authHeaders,
  });

  // Use first calendar that supports VTODO
  calendar = calendars.find((c) => c.components?.includes('VTODO')) ?? calendars[0];

  if (!calendar) {
    throw new Error('No calendar found for testing');
  }
});

describe('VTODO operations', () => {
  const todoUrls: string[] = [];

  afterAll(async () => {
    // Clean up all created todos
    for (const url of todoUrls) {
      try {
        await deleteTodo({
          todo: { url, etag: '' },
          headers: authHeaders,
        });
      } catch (error) {
        console.warn(`Failed to delete todo at ${url}:`, error);
      }
    }
  });

  test('should create a todo', async () => {
    let todoString = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo1.ics`,
      'utf-8'
    );

    // Make UID unique
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    todoString = todoString.replace('UID:todo1-test@philflow.io', `UID:todo1-${uniqueId}@philflow.io`);

    const filename = `test-todo-${uniqueId}.ics`;
    const response = await createTodo({
      calendar,
      iCalString: todoString,
      filename,
      headers: authHeaders,
    });

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
    todoUrls.push(new URL(filename, calendar.url).href);
  });

  test('should fetch todos from calendar', async () => {
    // Create a todo first
    let todoString = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo2.ics`,
      'utf-8'
    );

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    todoString = todoString.replace('UID:todo2-test@philflow.io', `UID:todo2-${uniqueId}@philflow.io`);

    const filename = `test-fetch-todo-${uniqueId}.ics`;
    const createResponse = await createTodo({
      calendar,
      iCalString: todoString,
      filename,
      headers: authHeaders,
    });

    expect(createResponse.status).toBeGreaterThanOrEqual(200);
    expect(createResponse.status).toBeLessThan(400);

    todoUrls.push(new URL(filename, calendar.url).href);

    // Fetch todos
    const todos = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);

    // Check that at least one todo has the expected properties
    const todo = todos[0];
    expect(todo).toHaveProperty('url');
    expect(todo).toHaveProperty('data');
    expect(todo).toHaveProperty('etag');
    expect(typeof todo.data).toBe('string');
    expect(todo.data).toContain('BEGIN:VTODO');
    expect(todo.data).toContain('END:VTODO');
  });

  test('should update a todo', async () => {
    // Create a todo
    let todoString = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo1.ics`,
      'utf-8'
    );

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    todoString = todoString.replace('UID:todo1-test@philflow.io', `UID:todo1-${uniqueId}@philflow.io`);

    const filename = `test-update-todo-${uniqueId}.ics`;
    const createResponse = await createTodo({
      calendar,
      iCalString: todoString,
      filename,
      headers: authHeaders,
    });

    expect(createResponse.status).toBeGreaterThanOrEqual(200);
    expect(createResponse.status).toBeLessThan(400);

    const todoUrl = new URL(filename, calendar.url).href;
    todoUrls.push(todoUrl);

    // Fetch the created todo to get its etag
    const todos = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    const createdTodo = todos.find((t) => t.url === todoUrl);
    expect(createdTodo).toBeDefined();

    const todo = createdTodo!;

    expect(todo.data).toBeDefined();
    expect(typeof todo.data).toBe('string');

    // Update the todo
    const updatedData = todo.data.replace(
      'SUMMARY:Test Todo 1',
      'SUMMARY:Updated Test Todo 1'
    );

    const updateResponse = await updateTodo({
      todo: {
        url: todo.url,
        data: updatedData,
        etag: todo.etag,
      },
      headers: authHeaders,
    });

    expect(updateResponse.status).toBeGreaterThanOrEqual(200);
    expect(updateResponse.status).toBeLessThan(300);

    // Fetch again to verify update
    const allTodosAfterUpdate = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    const updatedTodo = allTodosAfterUpdate.find((t) => t.url === todoUrl);
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo!.data).toContain('Updated Test Todo 1');
  });

  test('should delete a todo', async () => {
    // Create a todo
    let todoString = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo3.ics`,
      'utf-8'
    );

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    todoString = todoString.replace('UID:todo3-test@philflow.io', `UID:todo3-${uniqueId}@philflow.io`);

    const filename = `test-delete-todo-${uniqueId}.ics`;
    const createResponse = await createTodo({
      calendar,
      iCalString: todoString,
      filename,
      headers: authHeaders,
    });

    expect(createResponse.status).toBeGreaterThanOrEqual(200);
    expect(createResponse.status).toBeLessThan(400);

    const todoUrl = new URL(filename, calendar.url).href;

    // Fetch to get etag
    const allTodos = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    const todos = allTodos.filter((t) => t.url === todoUrl);
    expect(todos.length).toBe(1);

    // Delete the todo
    const deleteResponse = await deleteTodo({
      todo: todos[0],
      headers: authHeaders,
    });

    expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
    expect(deleteResponse.status).toBeLessThan(300);

    // Verify deletion - fetch all todos and check the deleted one is not present
    const todosAfterDeletion = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    const deletedTodo = todosAfterDeletion.find((t) => t.url === todoUrl);
    expect(deletedTodo).toBeUndefined();
  });

  test('should handle multiple todos with multiGet', async () => {
    let todo1String = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo1.ics`,
      'utf-8'
    );
    let todo2String = await fsp.readFile(
      `${__dirname}/../data/vtodo/todo2.ics`,
      'utf-8'
    );

    const rand = Math.random().toString(36).substring(7);
    const uniqueId1 = `${Date.now()}-${rand}-1`;
    const uniqueId2 = `${Date.now()}-${rand}-2`;

    todo1String = todo1String.replace('UID:todo1-test@philflow.io', `UID:todo1-${uniqueId1}@philflow.io`);
    todo2String = todo2String.replace('UID:todo2-test@philflow.io', `UID:todo2-${uniqueId2}@philflow.io`);

    const filename1 = `test-multi-todo-1-${uniqueId1}.ics`;
    const filename2 = `test-multi-todo-2-${uniqueId2}.ics`;

    const response1 = await createTodo({
      calendar,
      iCalString: todo1String,
      filename: filename1,
      headers: authHeaders,
    });

    const response2 = await createTodo({
      calendar,
      iCalString: todo2String,
      filename: filename2,
      headers: authHeaders,
    });

    expect(response1.status).toBeGreaterThanOrEqual(200);
    expect(response1.status).toBeLessThan(400);
    expect(response2.status).toBeGreaterThanOrEqual(200);
    expect(response2.status).toBeLessThan(400);

    const url1 = new URL(filename1, calendar.url).href;
    const url2 = new URL(filename2, calendar.url).href;
    todoUrls.push(url1, url2);

    // Fetch multiple todos
    const allTodos = await fetchTodos({
      calendar,
      headers: authHeaders,
    });

    // Find our created todos
    const ourTodos = allTodos.filter((t) => t.url === url1 || t.url === url2);
    expect(ourTodos.length).toBe(2);
    expect(ourTodos.every((t) => t.data && t.data.includes('BEGIN:VTODO'))).toBe(true);
  });
});
