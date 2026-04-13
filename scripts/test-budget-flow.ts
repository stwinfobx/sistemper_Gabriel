import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBudgetFlow() {
  console.log('--- Testing Budget Flow (Direct DB) ---');
  
  try {
    // 1. Create a budget
    const count = await prisma.budget.count();
    const budgetNumber = `TEST-${new Date().getTime()}`;
    
    const budget = await prisma.budget.create({
      data: {
        number: budgetNumber,
        status: 'Teste',
        totalValue: 0
      }
    });
    console.log('Step 1: Budget created:', budget.number);

    // 2. Add an item to it
    const item = await prisma.budgetItem.create({
      data: {
        budgetId: budget.id,
        name: 'Janela Teste',
        width: 1000,
        height: 1000,
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        details: { cor: 'Branco' }
      }
    });
    console.log('Step 2: Item added to budget:', item.name);

    // 3. Update budget total value
    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: { totalValue: 1000 },
      include: { items: true }
    });

    console.log('Step 3: DB Verification:');
    console.log('- Total Value:', updatedBudget.totalValue.toString());
    console.log('- Items count:', updatedBudget.items.length);
    
    if (updatedBudget.items.length === 1 && Number(updatedBudget.totalValue) === 1000) {
      console.log('✅ BUDGET FLOW VALIDATED SUCCESSFULLY');
    } else {
      console.log('❌ VALIDATION FAILED');
    }

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBudgetFlow();
