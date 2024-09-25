/* eslint-disable prettier/prettier */
import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'child_process'


describe('Transaction routes', () =>{
  beforeAll ( async () =>{
    await app.ready()
  })
  
  afterAll ( async () =>{
      await app.close()
  })

  beforeEach (async()=>{
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () =>{
     const createTransactionResponse = await request(app.server)
     .post('/transactions')
     .send({
       title: 'New transaction',
       amount: 5000,
       type: 'credit',
     })
     
     const cookies = createTransactionResponse.get('Set-Cookie')
     if (!cookies) {
      throw new Error('No cookies were set in the response');
    }

     const listTransactionsResponse =  await request (app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      ])
  })

})
