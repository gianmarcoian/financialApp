'use client'

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { POST, GET, extractAuthFromQuery } from '@/scripts/web'
import { useSearchParams } from 'next/navigation';
import { Container, Input } from 'postcss';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';


export default function Home() {

  extractAuthFromQuery(useSearchParams());

  const [expenses, setExpenses] = useState([] as any[]);
  const [usedCategories, setUsedCategories] = useState([] as string[]);

  // Expense list
  const [selectedId, setSelectedId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editExpenseDateValue, setEditExpenseDate] = useState("");
  const [editExpenseAmountValue, setEditExpenseAmount] = useState("");
  const [editExpenseCategoryValue, setEditExpenseCategory] = useState("");
  const [editExpenseDescriptionValue, setEditExpenseDescription] = useState("");

  // Expense form
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');


  useEffect(() => {
    // Fetch the list of income sources when the component mounts

    getExpenses().then(expenses => {
      setExpenses(expenses ?? []);
      if (expenses) {
        var usedCategories = expenses.map(e => e.category as string);
        setUsedCategories(usedCategories);
      }
    })
  }, []);

  return (
    <>
      <Card>
        <Card.Title className='mb-0'>
          <h2 className='m-4 mb-0'>Expenses</h2>
        </Card.Title>
        <Card.Body>
          {getExpensesList(usedCategories, expenses, selectedId, setSelectedId, showEditModal, setShowEditModal, showDeleteModal, setShowDeleteModal, editExpenseDateValue, setEditExpenseDate, editExpenseAmountValue, setEditExpenseAmount, editExpenseCategoryValue, setEditExpenseCategory, editExpenseDescriptionValue, setEditExpenseDescription)}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          {getExpenseForm(usedCategories, date, setDate, amount, setAmount, category, setCategory, description, setDescription)}
        </Card.Body>
      </Card>
    </>
  );
}

async function getExpenses() {
  try {
    const resource = "profile/expense";
    const response = await GET(resource);

    var expenses = [];
    if (response.ok) {
      const data = await response.json();

      expenses = Object.entries(data).map(([k, v]) => v) as any[];
    } else {
      console.error('Error fetching expenses');
    }
  } catch (error) {
    console.error('An error occurred while fetching expenses:', error);
  }
  return expenses;
}

type StringSetter = React.Dispatch<React.SetStateAction<string>>;
function getExpensesList(categoryList: string[], expenses: any[], selectedId: string, setSelectedId: React.Dispatch<React.SetStateAction<string>>, showEditModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, showDeleteModal: boolean, setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>, editDate: string, setEditDate: StringSetter, editAmount: string, setEditAmount: StringSetter, editCategory: string, setEditCategory: StringSetter, editDescription: string, setEditDescription: StringSetter) {

  return (
    <>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Date">
                <Form.Control id='edit-expense-modal-date' type='date' placeholder='Date' defaultValue={editDate} onChange={(e) => setEditDate(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Amount">
                <Form.Control id='edit-expense-modal-amount' type='number' placeholder='Amount' defaultValue={editAmount} onChange={(e) => setEditAmount(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>

              <Form.FloatingLabel label="Category">
                <Form.Control id='edit-expense-modal-category' list='categories' className='mb-2' type='input' placeholder='Category' defaultValue={editCategory} onChange={(e) => setEditCategory(e.target.value)}></Form.Control>
              </Form.FloatingLabel>

              <datalist id='categories'>
                {categoryList.map((e, index) => (
                  <option key={index}>{e}</option>
                ))}
              </datalist>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Description">
                <Form.Control id='edit-expense-modal-description' className='mb-2' type='input' placeholder='Description' defaultValue={editDescription} onChange={(e) => setEditDescription(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowEditModal(false);
            onEditExpense(selectedId, editDate, editAmount, editCategory, editDescription);
          }}>Update</Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove the selected expense?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowDeleteModal(false);
            onDeleteExepense(selectedId);
          }}>Yes</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
        </Modal.Footer>
      </Modal>
      <div className='mt-4'>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th className='col-2'></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.date}</td>
                <td>{expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td>

                  <Button className='mr-2' variant='primary' onClick={() => {
                    setSelectedId(expense.id);

                    setEditDate(expense.date);
                    setEditAmount(expense.amount);
                    setEditCategory(expense.category);
                    setEditDescription(expense.description);

                    setShowEditModal(true);
                  }}>Edit</Button>
                  <Button variant='danger' onClick={() => {
                    setSelectedId(expense.id);
                    setShowDeleteModal(true);
                  }}>Delete</Button>

                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
    // <ul>
    //   {expenses.map((expense) => (
    //     <li key={expense.id}>
    //       {`ID: ${expense.id}, Date: ${expense.date}, Amount: ${expense.amount}, Category: ${expense.category}, Description: ${expense.description}`}
    //     </li>
    //   ))}
    // </ul>
  );
}

function onEditExpense(expenseId: string, date: string, amount: string, category: string, description: string) {
  const resource = '/profile/edit_expense';
  const payload = {
    "id": expenseId,
    "date": date,
    "amount": amount,
    "category": category,
    "description": description
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to update, please try again or contact support.");
    }
  });
}

function onDeleteExepense(expenseId: string) {
  const resource = '/profile/delete_expense';
  const payload = {
    "id": expenseId
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to remove expense, please try again or contact support.");
    }
  });
}


function getExpenseForm(categoryList: string[], date: string, setDate: StringSetter, amount: string, setAmount: StringSetter, category: string, setCategory: StringSetter, description: string, setDescription: StringSetter) {

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Send a POST request to the backend with the expense data
    const expenseData = { date, amount, category, description };

    try {
      const resource = "/profile/add_expense";
      const response = await POST(resource, expenseData);

      if (response.ok) {
        // Request was successful
        console.log('Expense added successfully');
        window.location.reload();
        // You can perform further actions if needed
      } else {
        // Handle errors
        console.error('Error adding expense');
      }
    } catch (error) {
      console.error('An error occurred while sending the request:', error);
    }
  };



  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.FloatingLabel label="Date" className='mr-2'>
          <Form.Control type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Amount" className='mr-2'>
          <Form.Control type="text" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Category" className='mr-2'>
          <Form.Control list="categories" autoComplete='false' type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Description" className='mr-2'>
          <Form.Control type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.FloatingLabel>

        <datalist id='categories'>
          {categoryList.map((e, index) => (
            <option key={index}>{e}</option>
          ))}
        </datalist>

        <button className='ml-2 p-2 btn btn-sm btn-primary' type="submit">Add</button>
      </InputGroup>
    </Form>
  )

}

