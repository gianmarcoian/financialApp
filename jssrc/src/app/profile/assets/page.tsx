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

  const [assets, setAssets] = useState([] as any[]);


  // Asset list
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [showAssetEditModal, setShowAssetEditModal] = useState(false);
  const [showAssetDeleteModal, setShowAssetDeleteModal] = useState(false);

  const [editAssetNameValue, setEditAssetName] = useState("");
  const [editAssetTypeValue, setEditAssetType] = useState("");
  const [editAssetAmountValue, setEditAssetAmount] = useState("");
  const [editAssetCurValue, setEditAssetCurValue] = useState("");
  const [editAssetReturn, setEditAssetReturn] = useState("");

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');

  useEffect(() => {
    // Fetch the list of Asset when the component mounts

    getAssets().then(sources => {
      setAssets(sources ?? []);
    });
  }, []);

  return (
    <>
      <Card>
        <Card.Title className='mb-0'>
          <h2 className='m-4 mb-0'>Assets</h2>
        </Card.Title>
        <Card.Body>
          {getAssetList(assets, selectedAssetId, setSelectedAssetId, showAssetEditModal, setShowAssetEditModal, showAssetDeleteModal, setShowAssetDeleteModal, editAssetNameValue, setEditAssetName, editAssetTypeValue, setEditAssetType, editAssetAmountValue, setEditAssetAmount, editAssetCurValue, setEditAssetCurValue, editAssetReturn, setEditAssetReturn)}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          {getAssetForm(name, setName, type, setType, amount, setAmount, value, setValue, expectedReturn, setExpectedReturn)}
        </Card.Body>
      </Card>
    </>
  );
}

async function getAssets() {
  try {
    const resource = "/profile/asset";
    const response = await GET(resource);

    var Assets = [];
    if (response.ok) {
      const data = await response.json();

      Assets = Object.entries(data).map(([k, v]) => v) as any[];
    } else {
      // Handle errors
      console.error('Error fetching Asset sources');
    }
    return Assets;
  } catch (error) {
    console.error('An error occurred while sending the request:', error);
  }
}

type StringSetter = React.Dispatch<React.SetStateAction<string>>;


function getAssetForm(name: string, setName: StringSetter, type: string, setType: StringSetter, amount: string, setAmount: StringSetter, curValue: string, setCurValue: StringSetter, expectedReturn: string, setExpectedReturn: StringSetter) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();


    const AssetData = {
      name: name,
      type: type,
      amount: amount,
      current_value: curValue,
      expected_return: expectedReturn
    };

    try {
      const resource = "/profile/add_asset"; // Modify the resource endpoint accordingly
      const response = await POST(resource, AssetData);

      if (response.ok) {
        // Request was successful
        console.log('Asset added successfully');
        // You can perform further actions if needed
      } else {
        // Handle errors
        console.error('Error adding Asset');
      }

      window.location.reload();
    } catch (error) {
      console.error('An error occurred while sending the request:', error);
    }
  };



  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.FloatingLabel label="Name" className='mr-2'>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Type" className='mr-2'>
          <Form.Control type="text" value={type} onChange={(e) => setType(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Amount" className='mr-2'>
          <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Current Value" className='mr-2'>
          <Form.Control type="number" value={curValue} onChange={(e) => setCurValue(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Expected Return" className='mr-2'>
          <Form.Control type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
        </Form.FloatingLabel>
        <button className='ml-2 p-2 btn btn-sm btn-primary' type="submit">Add</button>
      </InputGroup>
    </Form>
  )

}


function getAssetList(Assets: any[], selectedId: string, setSelectedId: React.Dispatch<React.SetStateAction<string>>, showEditModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, showDeleteModal: boolean, setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>, editName: string, setEditName: StringSetter, editType: string, setEditType: StringSetter, editAmount: string, setEditAmount: StringSetter, editCurValue: string, setEditCurValue: StringSetter, editReturn: string, setEditReturn: StringSetter) {
  return (
    <div className='mt-4'>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Name">
                <Form.Control type='input' placeholder='Name' defaultValue={editName} onChange={(e) => setEditName(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Type">
                <Form.Control className='mb-2' type='input' placeholder='Type' defaultValue={editType} onChange={(e) => setEditType(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Amount">
                <Form.Control type='number' placeholder='Amount' defaultValue={editAmount} onChange={(e) => setEditAmount(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Current Value">
                <Form.Control type='number' placeholder='Current Value' defaultValue={editCurValue} onChange={(e) => setEditCurValue(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Expected Return">
                <Form.Control className='mb-2' type='number' placeholder='Expected Return' defaultValue={editReturn} onChange={(e) => setEditReturn(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowEditModal(false);
            onEditAsset(selectedId, editName, editType, editAmount, editCurValue, editReturn);
          }}>Update</Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove the selected Asset?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowDeleteModal(false);
            onDeleteAsset(selectedId);
          }}>Yes</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
        </Modal.Footer>
      </Modal>



      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Current Value</th>
            <th>Expected Return</th>
            <th className='col-2'></th>
          </tr>
        </thead>
        <tbody>
          {Assets.map((source, index) => (
            <tr key={index}>
              <td>{source.name}</td>
              <td>{source.type}</td>
              <td>{source.amount}</td>
              <td>{source.current_value}</td>
              <td>{source.expected_return}</td>
              <td>
                <Button className='mr-2' variant='primary' onClick={() => {
                  setSelectedId(source.id);

                  setEditName(source.name);
                  setEditType(source.type);
                  setEditAmount(source.amount);
                  setEditCurValue(source.current_value);
                  setEditReturn(source.expected_return);

                  setShowEditModal(true);
                }}>Edit</Button>
                <Button variant='danger' onClick={() => {
                  setSelectedId(source.id);
                  setShowDeleteModal(true);
                }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function onEditAsset(id: string, name: string, type: string, amount: string, curValue: string, expectedReturn: string) {
  const resource = 'profile/edit_asset';
  const payload = {
    "id": id,
    "name": name,
    "type": type,
    "amount": amount,
    "current_value": curValue,
    "expected_return": expectedReturn
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

function onDeleteAsset(id: string) {
  const resource = '/profile/delete_asset';
  const payload = {
    "id": id
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to remove Asset, please try again or contact support.");
    }
  });
}