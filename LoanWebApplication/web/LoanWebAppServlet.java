/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 *
 */
@WebServlet(urlPatterns = {"/LoanWebAppServlet"})
public class LoanWebAppServlet extends HttpServlet {

    
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
           response.setContentType("text/html;charset=UTF-8");
            String fullName = request.getParameter("fullName");
            String nric = request.getParameter("NRIC");
            String loanAmount = request.getParameter("loanAmount");
            String loanType = request.getParameter("loanType");

            try (PrintWriter out = response.getWriter()) {
                URL url = new URL("http://localhost9999:/?fullName="+fullName+"&nric="+nric+"&loanAmount="+loanAmount+"&loanType="+loanType);
                URLConnection conn = url.openConnection();
                BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
               RequestDispatcher d = request.getRequestDispatcher("loan.jsp");
               request.setAttribute("fullName", fullName);
               request.setAttribute("NRIC", NRIC);
               request.setAttribute("loanAmount", loanAmount);
               request.setAttribute("loanType", loanType);
               d.forward(request,response);
               return;
               
               /* while ((line = rd.readLine()) != null) {
                    if(Integer.parseInt(line) > 0) {
                        RequestDispatcher d = request.getRequestDispatcher("payment.jsp");
                        request.setAttribute("priceusd", priceusd);
                        request.setAttribute("price", price);
                        d.forward(request, response);
                        return;
                    } else {
                        RequestDispatcher d = request.getRequestDispatcher("bookingfail.jsp");
                        d.forward(request, response);
                        return;
                    }
                }*/
            }
        }
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
