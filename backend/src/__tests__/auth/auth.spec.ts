import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as auth from '../../auth/auth';
import { collections } from '../../services/database.service';
import * as bcrypt from 'bcryptjs';

jest.mock('../../services/database.service', () => ({
  collections: {
    users: {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs')

const mockRequest = {
  body: {
    username: 'testuser',
    password: 'testpassword',
  },
  params: {
    id: new ObjectId().toString(),
  },
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockInsertResult = { insertedId: new ObjectId() };
      const mockNewUser = { _id: mockInsertResult.insertedId, username: 'testuser', passwordHash: 'hashedpassword' };
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(null);
      (collections.users!.insertOne as jest.Mock).mockResolvedValueOnce(mockInsertResult);
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(mockNewUser);

      const hashPasswordSpy = jest.spyOn(auth, 'hashPassword').mockResolvedValueOnce('hashedpassword'); 
      const generateTokenSpy = jest.spyOn(auth, 'generateToken').mockReturnValueOnce('testtoken');

      await auth.registerUser(mockRequest, mockResponse);

      expect(collections.users!.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(collections.users!.insertOne).toHaveBeenCalledWith({ username: 'testuser', passwordHash: 'hashedpassword' });
      expect(collections.users!.findOne).toHaveBeenCalledWith({ _id: mockInsertResult.insertedId });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: 'testtoken' });
      expect(generateTokenSpy).toHaveBeenCalledWith(mockNewUser);
      expect(hashPasswordSpy).toHaveBeenCalledWith('testpassword');

      generateTokenSpy.mockRestore();
      hashPasswordSpy.mockRestore();
    });

    it('should return 400 if username already exists', async () => {
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce({ username: 'testuser' });

      await auth.registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('should handle errors gracefully', async () => {
      (collections.users!.findOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await auth.registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to register user', message: new Error('Database error') });
    });
  });

  describe('loginUser', () => {
    it('should log in a user successfully', async () => {
      const mockUser = { _id: new ObjectId(), username: 'testuser', passwordHash: 'hashedpassword' };
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const generateTokenSpy = jest.spyOn(auth, 'generateToken').mockReturnValueOnce('testtoken'); 

      await auth.loginUser(mockRequest, mockResponse);

      expect(collections.users!.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
      expect(mockResponse.json).toHaveBeenCalledWith({ token: 'testtoken' });
      expect(generateTokenSpy).toHaveBeenCalledWith(mockUser);

      generateTokenSpy.mockRestore();
    });

    it('should return 401 if user not found', async () => {
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(null);

      await auth.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = { _id: new ObjectId(), username: 'testuser', passwordHash: 'hashedpassword' };
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await auth.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle errors gracefully', async () => {
      (collections.users!.findOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await auth.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to log in', message: new Error('Database error') });
    });
  });

  describe('getUsers', () => {
    it('should get all users', async () => {
      const mockUsers = [{ _id: new ObjectId(), username: 'user1' }, { _id: new ObjectId(), username: 'user2' }];
      (collections.users!.find as jest.Mock).mockReturnValueOnce({ toArray: async () => mockUsers });

      await auth.getUsers(mockRequest, mockResponse);

      expect(collections.users!.find).toHaveBeenCalledWith({});
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      const mockUser = { _id: new ObjectId(mockRequest.params.id), username: 'testuser' };
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      await auth.getUserById(mockRequest, mockResponse);

      expect(collections.users!.findOne).toHaveBeenCalledWith({ _id: new ObjectId(mockRequest.params.id) });
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      (collections.users!.findOne as jest.Mock).mockResolvedValueOnce(null);

      await auth.getUserById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors gracefully', async () => {
      (collections.users!.findOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await auth.getUserById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch user', message: new Error('Database error') });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const mockUpdatedUser = { _id: new ObjectId(mockRequest.params.id), username: 'updateduser' };
      const mockFindOneAndUpdateResult = { value: mockUpdatedUser };
      (collections.users!.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockFindOneAndUpdateResult);

      await auth.updateUser(mockRequest, mockResponse);

      expect(collections.users!.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(mockRequest.params.id) },
        { $set: { username: 'testuser' } },
        { returnDocument: 'after' }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 404 if user not found', async () => {
      (collections.users!.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({ value: null });

      await auth.updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors gracefully', async () => {
      (collections.users!.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await auth.updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to update user', message: new Error('Database error') });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockDeleteResult = { deletedCount: 1 };
      (collections.users!.deleteOne as jest.Mock).mockResolvedValueOnce(mockDeleteResult);

      await auth.deleteUser(mockRequest, mockResponse);

      expect(collections.users!.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(mockRequest.params.id) });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 if user not found', async () => {
      const mockDeleteResult = { deletedCount: 0 };
      (collections.users!.deleteOne as jest.Mock).mockResolvedValueOnce(mockDeleteResult);

      await auth.deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors gracefully', async () => {
      (collections.users!.deleteOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await auth.deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete user', message: new Error('Database error') });
    });
  });
});
