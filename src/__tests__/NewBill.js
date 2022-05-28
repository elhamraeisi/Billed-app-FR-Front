/**
 * @jest-environment jsdom
 */

import { ROUTES_PATH } from "../constants/routes.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then message icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.className).toContain("active-icon")

    })
    test("Then I select an attachment and the file should be selected", async () => {
      const testFile = new File(["testdata"], "test.png", { type: "image/png" });

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('file'))
      const fileInput = screen.getByTestId('file')


      await waitFor(() =>
        fireEvent.change(fileInput, {
          target: { files: [testFile] },
        })
      );

      expect(fileInput.files.length).toBe(1)

    })
  })

  test("Then I select an attachment and the file should be uploaded to server", async () => {
    const testFile = new File(["testdata"], "test.png", { type: "image/png" });
    const spyMock = jest.spyOn(mockStore.bills(), "create")

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getByTestId('file'))
    const fileInput = screen.getByTestId('file')


    await waitFor(() =>
      fireEvent.change(fileInput, {
        target: { files: [testFile] },
      })
    );

    expect(spyMock).toHaveBeenCalled();

  })


  test("Then I checked the Date Picker is inserted", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getByTestId('datepicker'))
    const datePicker = screen.getByTestId('datepicker')

    const testValue = '2019-03-09';
    await waitFor(() =>
      fireEvent.change(datePicker, { target: { value: testValue } },
      ));
    expect(datePicker.value).toEqual(testValue);
  })

  test("Then I checked the submit button", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getByTestId('btn-send'))
    const btnSubmit = screen.getByTestId('btn-send')

    await waitFor(() =>
      fireEvent.click(btnSubmit),
    );
    expect(window.location.href).toContain("#employee/bills")

  })


  describe("When an error occurs on API", () => {
    beforeEach(() => {

      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("saves a bill in API and fails with 404 message error", async () => {
      const logSpy = jest.spyOn(console, 'log');

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('btn-send'))
      const btnSubmit = screen.getByTestId('btn-send')

      fireEvent.click(btnSubmit);
      await new Promise(process.nextTick);
      expect(logSpy).toHaveBeenCalledWith("Erreur 404");
    })


    test("saves a bill in API and fails with 500 message error", async () => {
      const logSpy = jest.spyOn(console, 'log');

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('btn-send'))
      const btnSubmit = screen.getByTestId('btn-send')

      fireEvent.click(btnSubmit);
      await new Promise(process.nextTick);
      expect(logSpy).toHaveBeenCalledWith("Erreur 500");
    })
  })
});
