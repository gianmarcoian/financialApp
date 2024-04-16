import Link from 'next/link';
import { Container, Form, Button, Stack, Modal, FloatingLabel } from 'react-bootstrap';
import { useRef, RefObject } from 'react';

export interface CredentialsProps {
  useModal?: boolean;
  registration?: boolean;
  modalTitle?: string;
  flipButtonPriority?: boolean;
  username?: string;

  leftButtonText: string | null;
  rightButtonText: string | null;

  nameRef?: RefObject<HTMLInputElement>;
  emailRef?: RefObject<HTMLInputElement>;
  passRef?: RefObject<HTMLInputElement>;

  nameRef_verify?: RefObject<HTMLInputElement>;
  emailRef_verify?: RefObject<HTMLInputElement>;
  passRef_verify?: RefObject<HTMLInputElement>;

  onModalLoginClicked?: (name: string, pass: string) => void;
  onModalRegisterClicked?: (name: string, name_verify: string, email: string, email_verify: string, pass: string, pass_verify: string) => void;
}

function CredentialsForm({ registration: registration, username, nameRef, emailRef, passRef, nameRef_verify, emailRef_verify, passRef_verify }: CredentialsProps) {
  return (
    <Form className="bg-gray">
      {registration &&
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <FloatingLabel label="Enter your email address">
            <Form.Control type="email" placeholder="Enter your email address" ref={emailRef} />
          </FloatingLabel>
        </Form.Group>

      }
      {registration &&
        <Form.Group className="mb-3" controlId="formEmail_verify">
          {/* <Form.Label>Verify email</Form.Label> */}
          <FloatingLabel label="Re-enter your email address">
            <Form.Control type="email" placeholder="Enter your email address" ref={emailRef_verify} />
          </FloatingLabel>
        </Form.Group>
      }
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label>User name</Form.Label>
        <FloatingLabel label="Enter your user name">
          <Form.Control type="text" placeholder="Enter your user name" defaultValue={username} ref={nameRef} />
        </FloatingLabel>
      </Form.Group>
      {registration &&
        <Form.Group className="mb-3" controlId="formName_verify">
          {/* <Form.Label>Verify user name</Form.Label> */}
          <FloatingLabel label="Re-enter your user name">
            <Form.Control type="text" placeholder="Enter your user name" ref={nameRef_verify} />
          </FloatingLabel>
        </Form.Group>
      }
      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <FloatingLabel label="Enter your password">
          <Form.Control type="password" placeholder="Enter your password" ref={passRef} />
        </FloatingLabel>
      </Form.Group>
      {registration &&
        <Form.Group className="mb-3" controlId="formPassword_verify">
          {/* <Form.Label>Verify password</Form.Label> */}
          <FloatingLabel label="Re-enter your password">
            <Form.Control type="password" placeholder="Enter your password" ref={passRef_verify} />
          </FloatingLabel>
        </Form.Group>
      }
    </Form>
  )
}

export function Credentials({ leftButtonText: leftButtonText = null, rightButtonText: rightButtonText = null, useModal = true, modalTitle = "Login", flipButtonPriority = false, onModalLoginClicked, onModalRegisterClicked, registration = true, username = "" }: CredentialsProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passInput = useRef<HTMLInputElement>(null);

  const nameInput_verify = useRef<HTMLInputElement>(null);
  const emailInput_verify = useRef<HTMLInputElement>(null);
  const passInput_verify = useRef<HTMLInputElement>(null);

  return (
    <main className="">
      <Container>
        {useModal ?
          <div className="modal show" style={{ display: 'block', position: 'initial' }}>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>{modalTitle}</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <CredentialsForm leftButtonText={leftButtonText} rightButtonText={rightButtonText} username={username} nameRef={nameInput} nameRef_verify={nameInput_verify} emailRef={emailInput} emailRef_verify={emailInput_verify} passRef={passInput} passRef_verify={passInput_verify} registration={registration} />
              </Modal.Body>

              <Modal.Footer>
                <Button variant={flipButtonPriority ? "secondary" : "primary"} onClick={() => onModalLoginClicked?.(nameInput?.current?.value ?? "", passInput?.current?.value ?? "")}>{leftButtonText ?? "Login"}</Button>
                <Button variant={flipButtonPriority ? "primary" : "secondary"} onClick={() => {
                  const name = nameInput?.current?.value ?? "";
                  const name_verify = nameInput_verify?.current?.value ?? "";
                  const email = emailInput?.current?.value ?? "";
                  const email_verify = emailInput_verify?.current?.value ?? "";
                  const pass = passInput?.current?.value ?? "";
                  const pass_verify = passInput_verify?.current?.value ?? "";
                  onModalRegisterClicked?.(name, name_verify, email, email_verify, pass, pass_verify);
                }}>{rightButtonText ?? "Register"}</Button>
              </Modal.Footer>
            </Modal.Dialog>

          </div>
          : <CredentialsForm rightButtonText={rightButtonText} leftButtonText={leftButtonText} username={username} />
        }
      </Container>
    </main>
  )
}